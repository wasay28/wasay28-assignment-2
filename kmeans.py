import numpy as np

class KMeans:
    def __init__(self, n_clusters, max_iter=100):
        self.n_clusters = n_clusters
        self.max_iter = max_iter

    def fit(self, X):
        self.centroids = self._init_centroids(X)
        
        for _ in range(self.max_iter):
            clusters = self._assign_clusters(X)
            new_centroids = self._update_centroids(X, clusters)
            
            if np.all(self.centroids == new_centroids):
                break
            
            self.centroids = new_centroids
        
        return self._assign_clusters(X)

    def _init_centroids(self, X):
        indices = np.random.choice(X.shape[0], self.n_clusters, replace=False)
        return X[indices]

    def _assign_clusters(self, X):
        distances = np.sqrt(((X - self.centroids[:, np.newaxis])**2).sum(axis=2))
        return np.argmin(distances, axis=0)

    def _update_centroids(self, X, clusters):
        new_centroids = np.array([X[clusters == k].mean(axis=0) for k in range(self.n_clusters)])
        return new_centroids