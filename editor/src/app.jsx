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

const App = () => {
  const [contents, setContents] = useState([]);

  async function getData(entry, lang) {
    // read file stream from zip entry
    console.log('getData', entry, lang);

    let stream = new TransformStream();
    let data = new Response(stream.readable).text();
    await entry.data.getData(stream.writable);
    let script = await data;

    let options = {};
    options.lang = lang;
    options.type = 'script-only';
    options.content = script;

    console.log('options', options);
    
    setContents([new scriptEditor(options)]);
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
      getData(entry, 'lua').then(() => {
        console.log('done');
      });

      // todo - add better context handling (trigger, callback, etc.)
    }

    if (entry.name.includes('.txt')) {
      console.log('open in text editor');
      getData(entry, 'plaintext');
    }

    if (entry.name.includes('.json')) {
      console.log('open in json editor');
      getData(entry, 'json');
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
