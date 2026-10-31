export default function ErrorMessage({ message }) {
  return (
    Object.keys(message).length > 0 && (
      <section role="alert">
        {Object.keys(message).map((key) => (
          <b>{message[key]}</b>
        ))}
      </section>
    )
  );
}
