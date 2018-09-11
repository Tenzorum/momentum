import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import Lozenge from '@atlaskit/lozenge'
import {AkCodeBlock, AkCode} from '@atlaskit/code'
import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import createNode from '../p2p/create-node';
import {transferEtherNoReward} from 'tenzorum'

let nodes = [];

export default class HomePage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  state = {
    connectedTo: '',
    id: '',
    peerId: '',
    nodeStatus: '',
  };

  componentDidMount() {
    createNode((err, node) => {
      if (err) {
        return console.log('Could not create the Node, check if your browser has WebRTC Support', err)
      }

      node.on('peer:discovery', (peerInfo) => {
        // console.log('Discovered a peer')
        const idStr = peerInfo.id.toB58String()
        // console.log('Discovered: ' + idStr)
        this.setState({peerId: idStr})
        node.dial(peerInfo, (err, conn) => {
          // if (err) { return console.log('Failed to dial:', idStr) }
        })
      });

      node.on('peer:connect', (peerInfo) => {
        const idStr = peerInfo.id.toB58String()
        console.log('Got connection to: ' + idStr)
        nodes.push('Connected to: ' + idStr)
        this.setState({id: idStr});
      })

      node.on('peer:disconnect', (peerInfo) => {
        const idStr = peerInfo.id.toB58String()
        console.log('Lost connection to: ' + idStr)
        this.setState({connectedTo: 'Disconnected'})
      })

      node.start((err) => {
        if (err) {
          return console.log('WebRTC not supported')
        }

        const idStr = node.peerInfo.id.toB58String()

        this.setState({nodeStatus: idStr})

        console.log('Node is listening o/')

        // NOTE: to stop the node
        // node.stop((err) => {})
      })
    })
  }

  transferETH = async () => {
    try {
      const transfer = await transferEtherNoReward(1, "0xd4a0d9531Bf28C26869C526b2cAd2F2eB77D3844")
      console.log('hello')
    } catch(e) {
      console.log('ERROR WITH TRANSFER', e);
    }
  }


  render() {
    return (
      <ContentWrapper>
        <PageTitle>Home</PageTitle>
        <section style={{marginBottom: '10px'}}>
          <p>
            Connected to <a href="https://localhost:3000">{this.state.id}</a>
          </p>
          {this.state.peerId && <p>
            Peer discovered at <a href="https://localhost:3000">{this.state.peerId}</a>
          </p>
          }
          <p>
            Node Status: <Lozenge appearance={this.state.nodeStatus ? "success" : "removed"}>{this.state.nodeStatus ? "Ready" : "Loading"}</Lozenge> <Lozenge appearance={this.state.nodeStatus ? "inprogress" : "removed"}>{this.state.nodeStatus ? this.state.nodeStatus : "Not Connected"}</Lozenge>
          </p>
          <p>
            Connection Status: <Lozenge appearance={this.state.id ? "success" : "removed"}>{this.state.id ? "Connected" : "Unconnected"}</Lozenge> <Lozenge appearance={this.state.id ? "inprogress" : "removed"}>{this.state.id ? this.state.id : "Not Connected"}</Lozenge>
          </p>
        </section>
        <ButtonGroup style={{marginBottom: 10}}>
          <Button
            appearance="primary"
            onClick={this.context.showModal}
            onClose={() => { }}
          >Stake Tenz</Button>
          <Button onClick={this.context.addFlag}>Show Entries</Button>
          <Button onClick={this.transferETH}>Transfer ETH</Button>
        </ButtonGroup>
        <br/>
        <AkCodeBlock language="c" text={nodes.map(node => (node + "\n").replace(/,/g , ""))}/>
      </ContentWrapper>
    );
  }
}
