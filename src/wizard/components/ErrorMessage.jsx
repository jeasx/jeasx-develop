export default function ErrorMessage({ message }) {
  return (
    Object.keys(message).length > 0 && (
      <ul role="alert" class="wizard-errors">
        {Object.keys(message).map((key) => (
          <li>{message[key]}</li>
        ))}
      </ul>
    )
  );
}
