import Game from './components/Game';

export default async function Home() {
  return (
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
    <div className="game-content">
      <div className="game-wrapper">
        <Game />
      </div>
    </div>
  );
}
