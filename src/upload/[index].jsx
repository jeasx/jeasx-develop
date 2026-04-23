import Layout from "../Layout";

export default async function () {
  return (
    <Layout
      title="How to upload and transform images in Jeasx with Sharp"
      description="Handling binary assets and image transformations with upload forms."
    >
      <h1>Upload and transform images in Jeasx</h1>
      <p>
        This example demonstrates how to handle binary uploads and image transformations in Jeasx.
        As Jeasx is focused on the core technologies, image transformation is implemented in
        userland with the help of the <a href="https://sharp.pixelplumbing.com">Sharp</a> image
        processor.
      </p>
      <form action="./image" method="post" enctype="multipart/form-data" target="_blank">
        <label>
          Convert to format
          <select name="format">
            <option>avif</option>
            <option>webp</option>
          </select>
        </label>
        <label>
          Resize to
          <select name="size">
            <option>160</option>
            <option>320</option>
            <option>640</option>
          </select>
        </label>
        <label>
          Rotate
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
          Choose a picture (jpg only)
          <input type="file" name="upload" accept="jpg" required />
        </label>
        <button class="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </Layout>
  );
}
