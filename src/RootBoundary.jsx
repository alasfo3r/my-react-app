import React from 'react';

export default class RootBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, err: null }; }
  static getDerivedStateFromError(err){ return { hasError: true, err }; }
  componentDidCatch(err, info){ console.error('RootBoundary', err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding: 24, color: '#b91c1c', fontWeight: 700}}>
          Something went wrong. Check console for details.
        </div>
      );
    }
    return this.props.children;
  }
}
