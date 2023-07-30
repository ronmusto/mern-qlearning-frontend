import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTable } from 'react-table';
import './AI.module.css';
import { Chart, BarController, LinearScale, CategoryScale, BarElement } from 'chart.js';

Chart.register(BarController, LinearScale, CategoryScale, BarElement);

const AI = () => {
  const [prediction, setPrediction] = useState('');
  const [inputs, setInputs] = useState({
    medInc: '2.5',
    houseAge: '35',
    aveRooms: '5',
    aveBedrms: '1',
    population: '1000',
    aveOccup: '3',
    latitude: '34',
    longitude: '-118'
  });

  const [importances, setImportances] = useState([]);

  // ADD THIS NEW STATE VARIABLE
  const [key, setKey] = useState(0);

  const expectedFeatures = ['medInc', 'houseAge', 'aveRooms', 'aveBedrms',
   'population', 'aveOccup', 'latitude', 'longitude'];

  const handleChange = (event) => {
    setInputs({ ...inputs, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: Object.values(inputs) })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Format the prediction into a dollar amount
        const predictedPrice = (data.prediction * 100000).toFixed(2);
        // Convert the price to a string and add commas as thousands separators
        const formattedPrice = Number(predictedPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        setPrediction(`Predicted Price: ${formattedPrice}`);
        setImportances(data.importances);
        
        // Increment the key here
        setKey(prevKey => prevKey + 1);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  // Sort the features by their importances
  const chartData = {
    labels: expectedFeatures,
    datasets: [
      {
        label: 'Feature Importances',
        data: importances,
        backgroundColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  chartData.labels.sort((a, b) => chartData.datasets[0].data[expectedFeatures.indexOf(b)] - chartData.datasets[0].data[expectedFeatures.indexOf(a)]);
  chartData.datasets[0].data.sort((a, b) => b - a);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Feature',
        accessor: 'feature', // accessor is the "key" in the data
      },
      {
        Header: 'Value',
        accessor: 'value',
      },
    ],
    []
  );

  const tableData = React.useMemo(
    () => expectedFeatures.map((feature, index) => ({
      feature,
      value: inputs[feature]
    })),
    [inputs]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: tableData });

  return (
    <div>
      <h1>My Prediction Form</h1>
      <form id="predict-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <h3>Median Income (0 to 10):</h3>
          <br />
          <input type="number" id="medInc" name="medInc" onChange={handleChange} value={inputs.medInc}/>
          <br />
        </div>
        <div className="form-group">
          <h3>House Age (0 to 50):</h3>
          <br />
          <input type="number" id="houseAge" name="houseAge" onChange={handleChange} value={inputs.houseAge}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Average Rooms (0 to 10):</h3>
          <br />
          <input type="number" id="aveRooms" name="aveRooms" onChange={handleChange} value={inputs.aveRooms}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Average Bedrooms (0 to 5):</h3>
          <br />
          <input type="number" id="aveBedrms" name="aveBedrms" onChange={handleChange} value={inputs.aveBedrms}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Population (0 to 5000):</h3>
          <br />
          <input type="number" id="population" name="population" onChange={handleChange} value={inputs.population}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Average Occupancy (0 to 10):</h3>
          <br />
          <input type="number" id="aveOccup" name="aveOccup" onChange={handleChange} value={inputs.aveOccup}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Latitude (33 to 42):</h3>
          <br />
          <input type="number" id="latitude" name="latitude" onChange={handleChange} value={inputs.latitude}/>
          <br />
        </div>
        <div className="form-group">
          <h3>Longitude (-124 to -114):</h3>
          <br />
          <input type="number" id="longitude" name="longitude" onChange={handleChange} value={inputs.longitude}/>
          <br />
        </div>
        <div className="form-group">
          <button type="submit">Predict</button>
        </div>
      </form>
      <div id="prediction">{prediction}</div>
      <div>
        <h2>Feature Importances</h2>
        <p>This bar chart shows the importance of each feature for predicting house prices, 
          according to our machine learning model. The taller the bar, the more important the
           feature. For example, if the 'Median Income' bar is taller than the 'House Age' 
           bar, that means median income is a more important predictor of house price than 
           house age. Note that this doesn't tell us whether house prices go up or down as 
           these features increase; it only tells us how important the feature is for making 
           accurate predictions.</p>
        <Bar data={chartData} options={options} key={key} />
      </div>
      <div className="table-container">
        <table {...getTableProps()} style={{ margin: 'auto' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AI;