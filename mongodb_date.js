import React from 'react';

const TimestampConverter = ({ createdAt, updatedAt }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedDate = `${date.toLocaleDateString()} ${hours}:${minutes}`;
    return formattedDate;
  };

  return (
    <div>
      <p>Created At: {formatDate(createdAt)}</p>
      <p>Updated At: {formatDate(updatedAt)}</p>
    </div>
  );
};

export default TimestampConverter;




import React from 'react';
import { format } from 'date-fns';

const TimestampConverter = ({ createdAt, updatedAt }) => {
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
  };

  return (
    <div>
      <p>Created At: {formatTimestamp(createdAt)}</p>
      <p>Updated At: {formatTimestamp(updatedAt)}</p>
    </div>
  );
};

export default TimestampConverter;
