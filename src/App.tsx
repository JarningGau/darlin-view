export default function App() {
  return (
    <main>
      <h1>darlin-view</h1>
      <label>
        Array
        <select aria-label="Array" defaultValue="CA">
          <option value="CA">CA</option>
          <option value="TA">TA</option>
          <option value="RA">RA</option>
        </select>
      </label>
      <button type="button">Upload alignment TSV</button>
    </main>
  );
}
