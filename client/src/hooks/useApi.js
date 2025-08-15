import { useState, useEffect } from 'react';

const useApi = (apiFunction, dependencies = []) => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 const response = await apiFunction();
 setData(response.data);
 } catch (err) {
 setError(err.response?.data?.error || err.message || 'An error occurred');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, dependencies);

 const refetch = () => {
 fetchData();
 };

 return { data, loading, error, refetch };
};

export default useApi;
