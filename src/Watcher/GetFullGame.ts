import { AxiosInstance } from "axios";

export const getFullGame = async (
  client: AxiosInstance,
  id: number,
): Promise<FullGameType> => {
  const {
    name,
    is_free,
    categories,
    recommendations,
    price_overview,
    metacritic,
  } = (
    await client.get(
      `https://store.steampowered.com/api/appdetails?appids=${id}`,
    )
  ).data[id].data as ResponseFullType;

  return {
    name,
    link: `https://store.steampowered.com/app/${id}`,
    price: is_free ? "0" : price_overview.final_formatted,
    isFree: is_free,
    score: metacritic?.score,
    categories: categories
      .map((category) => ` - ${category.description}\n`)
      .join(""),
    recomendations: recommendations.total,
  };
};

type ResponseFullType = {
  name: string;
  is_free: boolean;
  price_overview: {
    final_formatted: string;
  };
  metacritic: { score: number };
  categories: [{ id: number; description: string }];
  recommendations: { total: number };
};

export type FullGameType = {
  name: string;
  link: string;
  price?: string;
  isFree?: boolean;
  score?: number;
  categories: string;
  recomendations: number;
};
