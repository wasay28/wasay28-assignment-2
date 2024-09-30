import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

function App() {
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [nClusters, setNClusters] = useState(3);

  useEffect(() => {
    generateRandomPoints();
  }, []);

  const generateRandomPoints = () => {
    const newPoints = Array.from({ length: 200 }, () => [
      Math.random() * 800,
      Math.random() * 600,
    ]);
    setPoints(newPoints);
  };

  const runKMeans = async () => {
    const response = await fetch('http://127.0.0.1:5000/api/kmeans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points, n_clusters: nClusters }),
    });
    const data = await response.json();
    setClusters(data.clusters);
    setCentroids(data.centroids);
  };

  return (
    <div>
      <h1>KMeans Clustering Visualization</h1>
      <button onClick={generateRandomPoints}>Generate New Points</button>
      <input
        type="number"
        value={nClusters}
        onChange={(e) => setNClusters(Number(e.target.value))}
        min="1"
        max="10"
      />
      <button onClick={runKMeans}>Run KMeans</button>
      <svg width="800" height="600">
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point[0]}
            cy={point[1]}
            r="3"
            fill={clusters[i] ? `hsl(${(clusters[i] * 360) / nClusters}, 100%, 50%)` : 'black'}
          />
        ))}
        {centroids.map((centroid, i) => (
          <circle
            key={i}
            cx={centroid[0]}
            cy={centroid[1]}
            r="5"
            fill="red"
            stroke="black"
          />
        ))}
      </svg>
    </div>
  );
}

export default App;