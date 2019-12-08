import React from 'react'
import axios from 'axios'
import SearchBar from '../components/SearchBar'
import VideoDetail from '../components/VideoDetails'
import VideoList from './VideoList'
import Video from '../components/Video'

import './App.css'

const API_END_POINT = "https://api.themoviedb.org/3/"
const POPULAR_MOVIES_URL = "discover/movie?language=fr&sort_by=popularity.desc&include_adult=false&append_to_response=images"
const API_KEY = "api_key=64194ae703e2630dd0d31d51af95795c"
const SEARCH_URL = "search/movie?language=frinclude_adult=false"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/"

class App extends React.Component {

    state = {
        movieList: [],
        currentMovie: {},
        casting: [],
    }


    componentDidMount() {
        this.initMovies()
        this.cast()
        
    }

    initMovies = () => {
        axios
            .get(`${API_END_POINT}${POPULAR_MOVIES_URL}&${API_KEY}`)
            .then(response =>
                this.setState({
                    movieList: response.data.results.slice(1, 10),
                    currentMovie: response.data.results[0],

                }, function () {
                    this.applyVideoToCurrentMovie()
                    this.cast()
                    

                })

            )
    }

    

    onclickSearch = (searchText) => {
        if (searchText) {
            axios
                .get(`${API_END_POINT}${SEARCH_URL}&${API_KEY}&query=${searchText}&language=fr&include_adult=false`)
                .then(response => {
                    if (response.data && response.data.results[0]) {
                        if (response.data.results[0].id != this.state.currentMovie.id) {
                            this.setState({ currentMovie: response.data.results[0] }, () => {
                                this.applyVideoToCurrentMovie();
                                this.setRecommandation();
                                this.cast()
                                

                            })
                        }
                    }

                    else {
                        alert('Nous  ne parvenons pas à trouver ce film, essayer de le chercher en anglais')
                    }

                })

        }
    }

    applyVideoToCurrentMovie = () => {
        axios
            .get(`${API_END_POINT}movie/${this.state.currentMovie.id}?${API_KEY}&language=eng&append_to_response=videos&include_adult=true`)
            .then(response => {
                if (response.data.videos.results[0]) {
                    const youtube_key = response.data.videos.results[0].key;
                    let currentMovieWithVideo = this.state.currentMovie;
                    currentMovieWithVideo.videoId = youtube_key;
                    this.setState({ currentMovie: currentMovieWithVideo });
                }
                else {
                    let currentMovieWithVideo = this.state.currentMovie;
                    this.setState({ currentMovie: currentMovieWithVideo })
                    alert(`Nous n'avons pas encore de medias, ni de recommandations pour ce film`)

                }

            })
    }

    onClickrecieveCallback = (movie) => {
        this.setState({ currentMovie: movie }, function () { this.applyVideoToCurrentMovie() })
        this.setRecommandation();
    }

    setRecommandation = () => {
        axios
            .get(`${API_END_POINT}movie/${this.state.currentMovie.id}/recommendations?&${API_KEY}&language=fr `)
            .then(response =>
                this.setState({
                    movieList: response.data.results.slice(0, 10),
                })
            )
    }

    cast = () => {
        axios
            .get(`${API_END_POINT}movie/${this.state.currentMovie.id}/credits?${API_KEY}&language=en-US&page=1`)
            // https://api.themoviedb.org/3/movie/150540?api_key=64194ae703e2630dd0d31d51af95795c&append_to_response=credits
            .then(response =>
                this.setState({
                    casting: response.data.cast
                })              
            )

    }

    
    render() {
    console.log('casting',this.state.casting);
    
        const renderVideoList = () => {
            if (this.state.movieList.length >= 5) {
                return <VideoList movieList={this.state.movieList} />
            }
        }
        { renderVideoList() }
       
        console.log('video render with video', this.state.currentMovie);

        return (
            <div>
                <div className='search_bar'>
                    <SearchBar callback={this.onclickSearch} />
                </div>

                <div className='row'>
                    <div className='col-md-8'>

                        <Video videoId={this.state.currentMovie.videoId} />
                        <div className='detail'>
                            <VideoDetail title={this.state.currentMovie.title} dateSortie={this.state.currentMovie.release_date} description={this.state.currentMovie.overview} note={this.state.currentMovie.vote_average} img={`${IMAGE_BASE_URL}${this.state.currentMovie.poster_path}`} titleOrigin={this.state.currentMovie.original_title} />
                        </div>
                    </div>

                    <div className='col-md-4'>
                        <VideoList movieList={this.state.movieList} callback={this.onClickrecieveCallback} />
                    </div>

                </div>


            </div>
        )
    }

}


export default App;