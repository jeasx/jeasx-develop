import Layout from "../Layout";
import Image from "../sharp/Image";

export default async function () {
  const { products } = await (await fetch("https://dummyjson.com/products")).json();

  return (
    <Layout title="Products" description="Product overview" robots="index,nofollow">
      <h1>Product overview</h1>
      <div class="row center">
        {products.map(({ id, title, price, description, thumbnail }) => (
          <article class="col-12 col-md-6 col-lg-4">
            <header>
              <Image
                src={thumbnail}
                width="640"
                height="320"
                position="entropy"
                alt={title}
                immutable
                loading="lazy"
              />
              <hr />
              <b>{price} €</b>
            </header>
            <main>
              <h3>
                <a href={id}>{title}</a>
              </h3>
              <p>{description}</p>
            </main>
          </article>
        ))}
      </div>
    </Layout>
  );
}
