import { getHealthEndpoint } from "@/lib/api";

const Home = async () => {
  const health = await getHealthEndpoint();

  return (
    <div>
      Home
      <h2>Server Running: </h2>
      {health.status}
    </div>
  );
};
export default Home;
