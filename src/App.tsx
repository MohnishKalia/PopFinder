import React, { useState, useEffect } from 'react';
import './App.css';


const API_URL = 'https://api.spotify.com/v1';

interface Playlist {
  items: Track[]
}
interface Track {
  track: {
    artists: {
      id: string
    }[]
  }
}
interface Artist {
  genres: string[]
}
type Obj = { [key: string]: number }

function App() {
  const [token, setToken] = useState('');
  const [genreList, setGenreList] = useState<Obj>({});
  const [playlist, setPlaylist] = useState('77ZsLLorWFdBeq1rRi7DGJ');
  const [popCount, setPopCount] = useState(0);

  useEffect(() => {
    (async () => {
      const b64 = Buffer.from(process.env.REACT_APP_CLIENTID! + ':' + process.env.REACT_APP_CLIENTSECRET!).toString('base64');

      const res = await fetch("https://accounts.spotify.com/api/token", {
        body: "grant_type=client_credentials",
        headers: {
          Authorization: "Basic " + b64,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
      })

      const json = await res.json();
      setToken(json["access_token"]);
    })();
  }, [])

  useEffect(() => {
    const authOptions = {
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    (async () => {
      // 77ZsLLorWFdBeq1rRi7DGJ
      const res = await fetch(`${API_URL}/playlists/${playlist}/tracks`, authOptions);

      const { items } = await res.json() as Playlist;
      console.log(items)
      if (items) {
        const genreObj = {} as Obj;
        for (const { track: { artists } } of items) {
          const { id } = artists[0];
          const resp = await fetch(`${API_URL}/artists/${id}`, authOptions);
          const { genres } = await resp.json() as Artist;
          genres.forEach(genre => {
            genreObj[genre] = genre in genreObj ? genreObj[genre] + 1 : 1;
          });
        }
        setGenreList(genreObj);
        setPopCount(Object.entries(genreList).reduce((num, [k, v]) => num + (k.includes('pop') ? 1 : 0), 0))

      }
    })();
  }, [playlist, token]);

  return (
    <>
      <div className="container">
        <p>{token}</p>
        <form>
          <input type="text" className="form-control" value={playlist} onChange={(e) => setPlaylist(e.currentTarget.value!)} />
        </form>
        {popCount}
      </div>
    </>
  );
}

export default App;
