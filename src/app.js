import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  SafeAreaView,
  Text,
  FlatList,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const bmap = require('bmapjs');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
    };
  }

  async componentDidMount() {
    // Write a bitquery
    var query = {
      v: 3,
      q: {find: {}},
    };

    // Encode it in base64 format
    var b64 = btoa(JSON.stringify(query));

    // Subscribe
    var bitsocket = new EventSource(
      'https://genesis.bitdb.network/s/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/' +
        b64,
    );
    let i = 0;
    // Event handler
    let self = this;
    bitsocket.onmessage = function(e) {
      let jsonData = JSON.parse(e.data);
      console.log(i++);
      let transactions = jsonData.data;
      try {
        let pre = bmap.TransformTx(transactions[0]);
        if (
          pre &&
          pre['MAP'] &&
          pre['MAP']['app'] &&
          pre['MAP']['app'] === 'twetch'
        ) {
          let {posts} = self.state;
          posts.reverse();
          posts.push({
            userId: pre['MAP']['mb_user'],
            comment: pre['MAP']['comment'],
            postDate: pre['MAP']['timestamp'],
            url: pre['MAP']['url'],
            text: pre['B']['content'],
          });
          posts.reverse();
          self.setState({posts});
          console.log(self.state.posts);
        }
      } catch (e) {
        // console.log(e.message);
      }
    };
  }

  render() {
    let {posts} = this.state;
    return (
      <View>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          {posts && posts.length === 0 ? (
            <View style={styles.container}>
              <Text style={styles.textWaiting}>Waiting new post</Text>
            </View>
          ) : (
            <FlatList
              style={styles.scrollView}
              data={this.state.posts}
              extraData={this.state.posts}
              renderItem={({item}) => (
                <Text style={styles.sectionDescription} key={item.key}>
                  {item.text || item.comment}
                </Text>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#FFF',
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWaiting: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  sectionDescription: {
    padding: 20,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    backgroundColor: Colors.lighter,
  },
});

export default App;
