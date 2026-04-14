import type { ItemType, ProcessedTokenType } from "../../../scripts/processItem"
import { Button, Container, Popover } from '@mantine/core';
import { Fragment } from "react/jsx-runtime";
import { useSettings } from "../../stores/settings";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadItem } from "../../catalog/loadItem";
import { IconHome } from '@tabler/icons-react';

import "./ItemPage.scss"
import type { SearchResults } from "cc-cedict";

export function ItemPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<ItemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    loadItem(id)
      .then((result) => {
        setData(result);
      })
      .catch(() => {
        setError("Item not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // --- UI states ---

  if (loading) {
    return <div>Loading item...</div>;
  }
  if (error) {
    return (
      <div>
        <HomeButton />
        <p>{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <HomeButton />
        <p>No data</p>
      </div>
    );
  }

  return (
    <div id="item-page">
      <HomeButton />
      <br />
      <br />
      <Item item={data} />
      <br />
      <br />
      <br />
      <Settings />
    </div>
  )
}

function Settings() {
  const {
    showPinyin,
    toggleShowPinyin,

    showTranslation,
    toggleShowTranslation,

    showTraditional,
    toggleShowTraditional
  } = useSettings();

  return (
    <div id="settings">
      <Button size="xs" color={showPinyin ? "blue" : "gray"} onClick={() => toggleShowPinyin()}>Pinyin</Button>
      <Button size="xs" color={showTranslation ? "blue" : "gray"} onClick={() => toggleShowTranslation()}>Translations</Button>
      <Button size="xs" color={showTraditional ? "blue" : "gray"} onClick={() => toggleShowTraditional()}>Traditional</Button>
    </div>
  )
}

function Item({ item }: { item: ItemType }) {
  return (
    <Container>
      <RenderProcessedTokens processedTokens={item.processed.title} translation={item.translation.title} title />
      <br />
      <RenderProcessedTokens processedTokens={item.processed.author} translation={item.translation.author} />
      <br />
      <RenderProcessedTokens processedTokens={item.processed.content} translation={item.translation.content} />
    </Container>
  )
}

function RenderProcessedTokens({
  processedTokens,
  title,
  translation,
}: {
  processedTokens: ProcessedTokenType[][],
  title?: boolean,
  translation: string,
}) {
  const { showPinyin, showTranslation } = useSettings();
  const translationRows = translation.split("\n");

  if (!showPinyin) {
    const Tag = title ? "h1" : "p";
    return (
      <div>
        {processedTokens.map((row, i) => {
          return (
            <Fragment key={i}>
              <Tag>{row.map(([token,pinyin,searchResult],j) => <TokenWithPopover key={j} pinyin={pinyin} searchResult={searchResult} token={token}/>)}</Tag>
              {showTranslation && <p className="translation">{translationRows[i]}</p>}
            </Fragment>
          )
        })}
      </div>
    )
  }

  return processedTokens.map((row, i) => (
    <div key={i} className="table-container">
      <table className="table-row">
        <tbody>
          <tr>{row.map(([token, pinyin, searchResult], j) => (
            <td key={j}>
              <TokenWithPopover pinyin={pinyin} searchResult={searchResult} token={token}/>
            </td>
          ))}</tr>
          {showPinyin && <tr>{row.map(([_, pinyin], j) => <td key={j} style={{ padding: "0 0.5rem" }}>{pinyin}</td>)}</tr>}
          {showTranslation && <tr><td colSpan={row.length}><p>{translationRows[i]}</p></td></tr>}
        </tbody>
      </table>
    </div>
  ));
}

function HomeButton() {
  return <nav className="home-button" ><a href={import.meta.env.BASE_URL}><Button size="xs"><IconHome /></Button></a></nav>
}

function TokenWithPopover({pinyin,token,searchResult}:{pinyin:string,token:string,searchResult:SearchResults}) {
  const [opened, setOpened] = useState(false);

  if(searchResult) {
    const entries = Array.isArray(searchResult) ? searchResult : Object.values(searchResult).flat();
    return (
      <Popover withArrow shadow="md" opened={opened} onChange={setOpened}>
        <Popover.Target>
          <span className={opened ? "opened" : ""} onClick={() => setOpened((o) => !o)}><Token token={token} searchResult={searchResult}/></span>
        </Popover.Target>
        <Popover.Dropdown>
          <h3><Token token={token} searchResult={searchResult}/></h3>
          <p>{pinyin}</p>
          {entries.map((value,k) => {
            return (
              <p key={k}>
                {value.english.join(", ")}
              </p>
            );
          })}
        </Popover.Dropdown>
      </Popover>
    )
  }

  return <Token token={token} searchResult={searchResult}/>;
}

function Token({token,searchResult}:{token:string,searchResult:SearchResults}) {
  const { showTraditional } = useSettings();

  if(searchResult) {
    try {
      const entry = Array.isArray(searchResult) ? searchResult[0] : Object.values(searchResult)[0][0];
      if(showTraditional) {
        return entry.traditional;
      }
      return entry.simplified;
    }
    catch(err) {
      console.error(token);
    }
  }

  return token;
}