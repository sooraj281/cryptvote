function Message({ message }) {
  if (!message.text) return null;

  const getClassName = () => {
    if (message.type === 'error') return 'error';
    if (message.type === 'info') return 'info';
    return 'success';
  };

  return (
    <div className={getClassName()}>
      {message.text}
    </div>
  );
}

export default Message;
