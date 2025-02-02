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
import ZipManager from './zip-manager/ZipManager.jsx';
import scriptEditor from './script-editor/index.jsx';

const App = () => {
  const [contents, setContents] = useState([]);

  /** Determine which module to load based on the selected file from zip package */
  function openFile(entry = highlightedEntry) {
    const options = {
      entries: [entry],
      filename: entry.name,
    };

    console.log('openFile', options);

    if (entry.name.includes('.lua')) {
      console.log('open in lua editor');

      options.lang = 'lua';
      options.type = 'script-only';

      setContents([scriptEditor(options)]);

      // todo - add better context handling (trigger, callback, etc.)
    }

    if (entry.name.includes('.txt')) {
      console.log('open in text editor');

      options.lang = 'plaintext';
      options.type = 'script-only';

      setContents([scriptEditor(options)]);
    }

    if (entry.name.includes('.json')) {
      console.log('open in json editor');

      options.lang = 'json';
      options.type = 'script-only';

      setContents([scriptEditor(options)]);

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

  return (
    <Container style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Sidebar style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }} width={420} collapsible>
        <ZipManager openFile={openFile} />
      </Sidebar>

      <Container style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header className="page-header"> </Header>
        <Content style={{ flexGrow: true, marginTop: '20px', marginBottom: '88px' }}>{contents.map((x) => x)}</Content>
      </Container>
    </Container>
  );
};

export default App;
