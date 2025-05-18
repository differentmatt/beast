import Game from './components/Game';

export default async function Home() {
  return (
    <div className="game-content">
      <div className="game-wrapper">
        <Game />
      </div>
    </div>
  );
}
