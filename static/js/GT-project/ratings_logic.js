// create fxn to output dis/approval line graph, takes date as input
function approval_fxn(date) {

    // convert date to moment.js object
    var date_moment = moment.unix(date/1000).add(1, 'days');
    var plotly_date = date_moment.format ('M/DD');

    // gather dis/approval data from https://projects.fivethirtyeight.com/trump-approval-ratings/
    var approval_csv = 'https://projects.fivethirtyeight.com/trump-approval-data/approval_topline.csv';
    d3.csv(approval_csv).then((response) => {

        // create blank arrays; divide values for before/after selected date to plot in different colors
        var approvals1 = [];
        var disapprovals1 = [];
        var approvals2 = [];
        var disapprovals2 = [];
        var poll_dates = [];

        // loop through responses, gather dates & approval/disapproval values
        for (var x = 0; x < response.length; x++) {
            var poll_date = response[x].modeldate
            var voter = response[x].subgroup;
            
            var approval = Math.round (response[x].approve_estimate * 10) / 10;
            var disapproval = Math.round (response[x].disapprove_estimate * 10) / 10;

            // isolate aggregate polls
            if (voter == 'All polls') {
                
                // create full array of correctly formatted dates
                var poll_date_moment = moment(poll_date, 'MM/DD/YYYY')
                var poll_date_format = poll_date_moment.format ('M/DD');
                
                poll_dates.push(poll_date_format);

                // push approval/disapproval values to respective arrays if they're before/after selected date
                if (poll_date_moment <= date_moment) {
                    approvals1.push(approval);
                    disapprovals1.push(disapproval);

                    approvals2.push(null);
                    disapprovals2.push(null);
                }

                else if (poll_date_moment > date_moment) {
                    approvals2.push(approval);
                    disapprovals2.push(disapproval);

                    approvals1.push(null);
                    disapprovals1.push(null);
                }

                // break the loop once we've reached the end of 2020 data
                if (poll_date == '1/1/2020') {
                    break;
                }
            }
        }

        // reverse date array for plotting
        var reverse_dates = poll_dates.reverse()

        // create plotly object
        var trace1 = {
            x: reverse_dates,
            y: approvals1.reverse(),
            type: 'scatter',
            mode: 'lines',
            name: 'approval',
            line: {
                shape: 'spline',
                color: 'green'
            }
        };

        var trace2 = {
            x: reverse_dates,
            y: approvals2.reverse(),
            type: 'scatter',
            mode: 'lines',
            name: 'approval',
            showlegend: false,
            line: {
                shape: 'spline',
                color: 'grey'
            }
        };

        var trace3 = {
            x: reverse_dates,
            y: disapprovals1.reverse(),
            type: 'scatter',
            mode: 'lines',
            name: 'disapproval',
            line: {
                shape: 'spline',
                color: 'red'
            }
        };

        var trace4 = {
            x: reverse_dates,
            y: disapprovals2.reverse(),
            type: 'scatter',
            mode: 'lines',
            name: 'disapproval',
            showlegend: false,
            line: {
                shape: 'spline',
                color: 'grey'
            }
        };

        var trace5 = {
            x: [plotly_date, plotly_date],
            y: [30, 70],
            type: 'scatter',
            hoverinfo: 'name',
            mode: 'lines',
            name: 'selected date',
            showlegend: false,
            line: {
                dash: 'dash',
                color: 'grey'
            },
        };

        var plotly_data = [trace1, trace2, trace3, trace4, trace5];

        var plotly_layout = {
            // title: "president trump's 2020 approval ratings",
            height: '315',
            // legend/annotation config
            // legend: {'orientation': 'h'},
            showlegend: false,
            hovermode: 'x unified',
            hoverlabel: {bgcolor: 'rgba (255, 255, 255, 0.7'},
            margin: {t: '20', l: '45', r: '15'},
            annotations: [
                {
                  x: "1/29",
                  y: "56",
                  text: '% disapproval',
                  font: {color: 'red'},
                  showarrow: false
                },
                {
                  x: "1/29",
                  y: "46",
                  text: '% approval',
                  font: {color: 'green'},
                  showarrow: false
                }
              ],
            xaxis: {
              title: 'date',
              showgrid: false,
              // spikeline config
              showspikes: true,
              spikemode: 'across',
              spikecolor: 'grey',
              spikedistance: -1,
              spikethickness: 1,
              spikedash: 'dot',
              // tick config
              tickmode: 'auto',
              nticks: 10
            },
            yaxis: {
                range: [38, 58],
                autorange: false,
                title: '% approval/disapproval'
            }
          }

        Plotly.newPlot('approval_plot', plotly_data, plotly_layout);
    })
}

// initialize graph
approval_fxn ('1577880000000');

// call fxn w/ listener whenever slider changes
dateSlider.noUiSlider.on('change', function (values, handle) {
    approval_fxn (values[handle]);
})