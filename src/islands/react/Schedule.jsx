/** @jsxImportSource react */

/** A React component which never runs in the browser: the page uses it with hydrate="none". */
export default function Schedule({ talks }) {
  return (
    <table className="schedule">
      <tbody>
        {talks.map(({ time, title, speaker }) => (
          <tr key={time}>
            <td>
              <time>{time}</time>
            </td>
            <td>
              <strong>{title}</strong>
              <span>{speaker}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
