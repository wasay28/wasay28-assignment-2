import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

function App() {
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [nClusters, setNClusters] = useState(3);
  const [initMethod, setInitMethod] = useState('random');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const svgRef = useRef();

  useEffect(() => {
    generateRandomPoints();
  }, []);

  useEffect(() => {
    drawVisualization();
  }, [points, clusters, centroids, currentStep]);

  const generateRandomPoints = () => {
    const newPoints = Array.from({ length: 200 }, () => [
      Math.random() * 800,
      Math.random() * 600,
    ]);
    setPoints(newPoints);
    setClusters([]);
    setCentroids([]);
    setSteps([]);
    setCurrentStep(0);
  };

  const runKMeans = async (toConvergence = false) => {
    const response = await fetch('http://127.0.0.1:5000/api/kmeans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        points, 
        n_clusters: nClusters, 
        init_method: initMethod,
        manual_centroids: initMethod === 'manual' ? centroids : undefined
      }),
    });
    const data = await response.json();
    setSteps(data.steps);
    if (toConvergence) {
      setClusters(data.final_clusters);
      setCentroids(data.final_centroids);
      setCurrentStep(data.steps.length - 1);
    } else {
      setCurrentStep(0);
      updateStep(0);
    }
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateStep(currentStep + 1);
    }
  };

  const updateStep = (step) => {
    setClusters(steps[step].clusters);
    setCentroids(steps[step].centroids);
  };

  const resetAlgorithm = () => {
    setClusters([]);
    setCentroids([]);
    setSteps([]);
    setCurrentStep(0);
    setIsManualSelection(false);
  };

  const handleManualCentroidSelection = (event) => {
    if (isManualSelection && centroids.length < nClusters) {
      const svg = d3.select(svgRef.current);
      const [x, y] = d3.pointer(event);
      setCentroids(prev => [...prev, [x, y]]);
    }
  };

  const drawVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.selectAll("circle.point")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => d[0])
      .attr("cy", d => d[1])
      .attr("r", 3)
      .attr("fill", (d, i) => clusters[i] ? d3.schemeCategory10[clusters[i] % 10] : "black");

    svg.selectAll("circle.centroid")
      .data(centroids)
      .enter()
      .append("circle")
      .attr("class", "centroid")
      .attr("cx", d => d[0])
      .attr("cy", d => d[1])
      .attr("r", 5)
      .attr("fill", "red")
      .attr("stroke", "black");
  };

  return (
    <div>
      <h1>KMeans Clustering Visualization</h1>
      <select value={initMethod} onChange={(e) => setInitMethod(e.target.value)}>
        <option value="random">Random</option>
        <option value="farthest_first">Farthest First</option>
        <option value="kmeans++">KMeans++</option>
        <option value="manual">Manual</option>
      </select>
      <input
        type="number"
        value={nClusters}
        onChange={(e) => setNClusters(Number(e.target.value))}
        min="1"
        max="10"
      />
      <button onClick={generateRandomPoints}>Generate New Points</button>
      <button onClick={() => runKMeans(false)}>Initialize KMeans</button>
      <button onClick={stepForward} disabled={currentStep === steps.length - 1}>Step Forward</button>
      <button onClick={() => runKMeans(true)}>Run to Convergence</button>
      <button onClick={resetAlgorithm}>Reset Algorithm</button>
      {initMethod === 'manual' && (
        <button onClick={() => setIsManualSelection(!isManualSelection)}>
          {isManualSelection ? 'Finish Selection' : 'Select Centroids'}
        </button>
      )}
      <svg
        ref={svgRef}
        width="800"
        height="600"
        onClick={handleManualCentroidSelection}
      />
    </div>
  );
}

export default App;