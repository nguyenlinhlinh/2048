import "./GameMessage.css";
type Props = {
  onClick: () => void;
  messageText: string;
  buttonLabel: string;
}
const MessageComponent = (props: Props) => {
  const { onClick, messageText, buttonLabel } = props;
  return (<div className='message-container'>
    <div className='message'>
      <p>{messageText}</p>
      <button className='game-button' onClick={onClick}>{buttonLabel}</button>
    </div>
  </div>)
}
export { type Props as Message };
export default MessageComponent;