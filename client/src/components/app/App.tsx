// import './App.css';

import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { boardService, sortedBoardState } from "../../recoil/modules/BoardService";
import { loginState, userService } from "../../recoil/modules/UserService";

function App() {
  const boards = useRecoilValue(sortedBoardState);
  const fetchAllBoards = boardService.useFetchAllBoards();
  const login = userService.useLogin();
  const fetchLoginState = userService.useFetchLoginState();
  const isLoggedIn = useRecoilValue(loginState);

  useEffect(() => {
    console.log(isLoggedIn);
    
    if (!isLoggedIn){
      login({
        username: "string",
        password: "string"
      })
    }

    if (isLoggedIn){
      fetchAllBoards();
    }
  }, [isLoggedIn]);

  return (
    <div className="App">
      {
        boards.map(board => {
          console.log(board);
          return <li>{board.name}</li>
        })
      }
    </div>
  );
}

export default App;
