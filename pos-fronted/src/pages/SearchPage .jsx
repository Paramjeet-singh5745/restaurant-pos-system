import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) fetchResults();
  }, [query]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">
        Search Results for "{query}"
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <div className="space-y-3">
          {results.map((order) => (
            <div
              key={order.order_id}
              className="bg-[#1f1f1f] p-4 rounded-xl border border-[#2a2a2a]"
            >
              <p>Order ID: {order.order_id}</p>
              <p>Customer: {order.customer_name}</p>
              <p>Table: {order.table_number}</p>
              <p>Status: {order.order_status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;