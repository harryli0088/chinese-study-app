import type { ItemType, ProcessedTokenType } from "../../../scripts/processItem"
import { Button } from '@mantine/core';
import { Fragment } from "react/jsx-runtime";
import { useSettings } from "../../stores/settings";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadItem } from "../../catalog/loadItem";
import { IconHome } from '@tabler/icons-react';

import "./ItemPage.scss"

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
        <div id="settings"><HomeButton/></div>
        <p>{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <div id="settings"><HomeButton/></div>
        <p>No data</p>
      </div>
    );
  }

  return (
    <div id="item-page">
      <Settings/>
      <Item item={data}/>
    </div>
  )
}

function Settings() {
  const {
    showPinyin,
    toggleShowPinyin,

    showTranslation,
    toggleShowTranslation,
  } = useSettings();

  return (
    <div id="settings">
      <HomeButton/>
      <Button size="xs" color={showPinyin ? "blue" : "gray"} onClick={() => toggleShowPinyin()}>Pinyin</Button>
      <Button size="xs" color={showTranslation ? "blue" : "gray"} onClick={() => toggleShowTranslation()}>Translations</Button>
    </div>
  )
}

function Item({item}:{item:ItemType}) {
  return (
    <div id="content">
      <RenderProcessedTokens processedTokens={item.processed.title} translation={item.translation.title}/>
      <br/>
      <RenderProcessedTokens processedTokens={item.processed.author} translation={item.translation.author}/>
      <br/>
      <RenderProcessedTokens processedTokens={item.processed.content} translation={item.translation.content}/>
    </div>
  )
}

function RenderProcessedTokens({
  processedTokens,
  translation,
}:{
  processedTokens:ProcessedTokenType[][],
  translation: string,
}) {
  const { showPinyin, showTranslation } = useSettings();
  const translationRows = translation.split("\n");

  if(!showPinyin) {
    return (
      <div>
        {processedTokens.map((row,i) => {
          return (
            <Fragment key={i}>
              <p>{row.map(([token]) => token)}</p>
              {showTranslation && <p>{translationRows[i]}</p>}
            </Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {processedTokens.map((row,i) => {
        return (
          <table className="table-row" key={i}>
            <tbody>
              <tr>{row.map(([token],j) => <td key={j}>{token}</td>)}</tr>
              {showPinyin && <tr>{row.map(([_,pinyin],j) => <td key={j} style={{padding:"0 0.5rem"}}>{pinyin}</td>)}</tr>}
              {showTranslation && <tr><td colSpan={row.length}><p>{translationRows[i]}</p></td></tr>}
            </tbody>
          </table>
        )
      })}
    </div>
  )
}

function HomeButton() {
  return <a className="home-button" href="/"><Button size="xs"><IconHome/></Button></a>
}