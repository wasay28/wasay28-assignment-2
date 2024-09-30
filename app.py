from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from kmeans import KMeans

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "KMeans Clustering API is running. Use the /api/kmeans endpoint for clustering."

@app.route('/api/kmeans', methods=['POST'])
def run_kmeans():
    data = request.json
    X = np.array(data['points'])
    n_clusters = data['n_clusters']
    
    kmeans = KMeans(n_clusters=n_clusters)
    clusters = kmeans.fit(X)
    
    return jsonify({
        'clusters': clusters.tolist(),
        'centroids': kmeans.centroids.tolist()
    })

if __name__ == '__main__':
    app.run(debug=True)