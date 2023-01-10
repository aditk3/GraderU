import "../Graph/styles/graph.scss";
import { Bar } from "react-chartjs-2";
import React from "react";
import { CategoryScale, LinearScale, BarElement, Chart } from "chart.js";

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(BarElement);

function GraphComponent(props) {
    const chartData = {
        labels: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C+', 'D+', 'D', 'D-', 'F'],
        // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
        datasets: [
            {
              label: 'Grade Distribution',
            //   data: [55, 96, 23, 11],
              data: props.data.distribution,
              borderColor: "#311b92",
              borderWidth: 1,
              backgroundColor: '#5e35b1',
              color: '#FFFFFF',
            }
        ],
        
    }

    return (
        <div>
            <h1 className="heading"> {props.data.subject} {props.data.number}: {props.data.name} </h1>
            <div className = "gradeChart" style={{backgroundColor:'#282828', borderRadius: 20, padding: 15}}>
                <Bar
                    data={chartData}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: `Grade distribution for ${props.data.profName}`,
                                position: "bottom"
                            },
                            legend: {
                                display: true,
                            }
                        },
                        scales: {
                            'x': {
                                grid: {
                                    color: '#777B7E'
                                }, 
                                ticks: {
                                    color: '#FFFFFF'
                                }
                            },
                            'y': {
                                grid: {
                                    color: '#777B7E'
                                },
                                ticks: {
                                    color: '#FFFFFF'
                                }
                            }
                        }
                    }}
                />
            </div>
            <h3 className="heading">Grade Distribution for {props.data.profName}</h3>
        </div> 
    )
}

export default GraphComponent;

// GraphComponent.propTypes = {
    // distribution: PropTypes.arrayOf(PropTypes.number).isRequired,
    // subject: PropTypes.string.isRequired,
    // number: PropTypes.number.isRequired,
    // name: PropTypes.string.isRequired,
    // profName: PropTypes.string.isRequired
// }