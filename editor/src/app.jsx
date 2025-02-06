/*                                                 *\
** ----------------------------------------------- **
**             Pixospritz - Editor   	             **
** ----------------------------------------------- **
**  Copyright (c) 2022-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import React, { useState } from 'react';
import { Container, Header, Sidebar, Content } from 'rsuite';
import ZipManager from './zip-manager/index.jsx';
import scriptEditor from './script-editor/index.jsx';
import { set } from './zip-manager/services/storage-service.js';
import imagePreview from './image-preview/index.jsx';

const App = () => {
  const [contents, setContents] = useState([]);

  async function getData(entry) {
    // read file stream from zip entry
    console.log('getData', entry);

    let stream = new TransformStream();
    let data = new Response(stream.readable).text();
    await entry.data.getData(stream.writable);
    return await data;
  }

  /**
   * render script editor
   * @param {*} entry
   * @param {string} lang
   */
  async function renderScriptEditor(entry, lang) {
    let script = await getData(entry);
    let options = {};
    options.lang = lang;
    options.type = 'script-only';
    options.content = script;

    console.log('options', options);

    setContents([new scriptEditor(options)]);
  }

  /**
   * render image preview
   * @param {*} entry
   */
  async function renderImagePreview(entry) {
    console.log('todo - render image preview');
    
    let imageBytes = await getData(entry);
    console.log({ imageBytes });

    let extension = entry.name.split('.').pop();
    let image = new Uint8Array(imageBytes.split(''));
    let base64Image = btoa(unescape(encodeURIComponent(imageBytes)));

    console.log({ imageBytes, extension, image, base64Image, url: 'data:image/' + extension + ';base64,' + base64Image });

    setContents([new imagePreview({ content: 'data:image/' + extension + ';base64,' + base64Image })]);
  }

  /** Determine which module to load based on the selected file from zip package */
  function openFile(entry = highlightedEntry) {
    const options = {
      entries: [entry],
      filename: entry.name,
    };

    console.log('openFile', options);

    if (entry.name.includes('.lua')) {
      console.log('open in lua editor');
      renderScriptEditor(entry, 'lua');
      // todo - add better context handling (trigger, callback, etc.)
    }

    if (entry.name.includes('.txt')) {
      console.log('open in text editor');
      renderScriptEditor(entry, 'plaintext');
    }

    if (entry.name.includes('.json')) {
      console.log('open in json editor');
      renderScriptEditor(entry, 'json');
      // todo - add better context handling (sprite, object, map, etc.)
    }

    if (
      entry.name.includes('.png') ||
      entry.name.includes('.gif') ||
      entry.name.includes('.jpg') ||
      entry.name.includes('.jpeg') ||
      entry.name.includes('.bmp')
    ) {
      console.log('todo - open in image viewer');
      renderImagePreview(entry);
      // todo - add better context handling (texture, image, tilemap, etc)
    }

    if (entry.name.includes('.mp3') || entry.name.includes('.wav') || entry.name.includes('.ogg')) {
      console.log('todo - open in audio editor');
    }

    if (entry.name.includes('.mtl') || entry.name.includes('.obj')) {
      console.log('todo - open in model viewer');
    }
  }

  console.log('App', contents);
  return (
    <Container style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Sidebar style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }} width={420} collapsible>
        <ZipManager openFile={openFile} />
      </Sidebar>

      <Container style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header className="page-header"> </Header>
        <Content style={{ flexGrow: true, marginTop: '20px', marginBottom: '88px' }}>
          {contents.map((x) => {
            console.log({ x });
            return x.render();
          })}
        </Content>
      </Container>
    </Container>
  );
};

export default App;
