import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const particles = {
  particles: {
    'number': {
      'value': 100
    },
    'size': {
        'value': 3
    }
  },
  interactivity: {
    'events': {
        'onhover': {
            'enable': true,
            'mode': 'repulse'
        }
    }
  }
}

const initialState ={
  isSignedIn: false,
  input: '',
  imageUrl: 'https://imgur.com/PCmQfWh.png',
  box: {},
  route: 'signin', 
  user: {
    id: '', 
    name: '', 
    email: '', 
    entries: 0, 
    joined: ''
  }  
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id, 
        name: data.name, 
        email: data.email, 
        entries: data.entries, 
        joined: data.joined
      }
    })
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onSubmit = (event) => {
    const {user, input} = this.state;
    event.preventDefault();
    if(input.length !== 0){
      this.setState({imageUrl: input})
      fetch('https://quiet-depths-83314.herokuapp.com/imageurl', {
        method: 'post', 
        headers: {'Content-Type': 'application/json', 
        'Accept': 'application/json'}, 
        body: JSON.stringify({
          input: input
        })
      })
      .then(response => response.json())
      .then((response) => {
        if(response){
          fetch('https://quiet-depths-83314.herokuapp.com/image', {
            method: 'put', 
            headers: {'Content-Type': 'application/json', 
            'Accept': 'application/json'}, 
            body: JSON.stringify({
              id: user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(user, {entries: count}))
          })
          .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      }
      )
      .catch(error => console.log(error));
    }
  }

  calculateFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width - face.right_col * width,
      bottomRow: height - face.bottom_row * height
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onRouteChange = (route) => {
    if(route === 'login'){
      this.setState({isSignedIn: true})
    }
    else{
      this.setState(initialState)
    }
    this.setState({route: route})
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return(
      <div className="App">
        <Particles params={particles} className='particles' />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        {route === 'login'
          ?<div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          :(route === 'signin'
          ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
