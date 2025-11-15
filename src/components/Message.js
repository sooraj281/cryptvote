import React from 'react';

function Message({ message }) {
  if (!message.text) return null;

  return (
    <div className={message.type === 'error' ? 'error' : 'success'}>
      {message.text}
    </div>
  );
}

export default Message;
