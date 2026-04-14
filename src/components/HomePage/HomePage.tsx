import { Button, Container } from "@mantine/core";
import { catalog, type CatalogType } from "../../catalog/catalog"

const groups = catalog.reduce((acc,item) => {
  if(!acc[item.type]) {
    acc[item.type] = [];
  }
  acc[item.type].push(item);

  return acc;
}, {} as Record<string,CatalogType[]>)

export function HomePage() {
  return (
    <Container>
      <h1>Chinese Study App</h1>
      {Object.entries(groups).map(([key,values],i) => (
        <div key={i}>
          <h3>{key}</h3>
          {values.map((v,j) => <a key={j} href={`${import.meta.env.BASE_URL}#/item/${v.name}`}><Button>{v.name}</Button></a>)}
        </div>
      ))}
    </Container>
  )
}