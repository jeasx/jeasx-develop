import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="Upload and transform images with sharp"
      description="Upload a JPEG image and convert, resize and rotate it with sharp."
    >
      <h1>Upload and transform images with sharp</h1>
      <p>
        Choose a JPEG image and the server converts, resizes and rotates it, then sends the result
        back to your browser. Jeasx doesn't ship an image processor, so the conversion is done in
        userland with <a href="https://sharp.pixelplumbing.com">sharp</a>. Your image isn't stored.
      </p>
      <form action="./image" method="post" enctype="multipart/form-data">
        <label>
          Convert to format
          <select name="format">
            <option>avif</option>
            <option>webp</option>
          </select>
        </label>
        <label>
          Resize to (pixels)
          <select name="size">
            <option>160</option>
            <option>320</option>
            <option>640</option>
          </select>
        </label>
        <label>
          Rotate by (degrees)
          <select name="rotate">
            <option>0</option>
            <option>30</option>
            <option>45</option>
            <option>60</option>
            <option>75</option>
            <option>90</option>
            <option>180</option>
          </select>
        </label>
        <label>
          Choose a JPEG image
          <input type="file" name="upload" accept=".jpg,.jpeg,image/jpeg" required />
        </label>
        <button class="btn btn-primary" type="submit">
          Convert image
        </button>
      </form>
    </Layout>
  );
}
