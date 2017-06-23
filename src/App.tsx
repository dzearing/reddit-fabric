import * as React from 'react';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { Reddit }  from './Reddit';

import './App.css';

class App extends React.Component<{}, {}> {
  render() {
    return (
      <Fabric>
        <Reddit />
      </Fabric>
    );
  }
}

export default App;
