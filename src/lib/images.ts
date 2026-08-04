const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  heroWoman: u("1604480132736-44c188fe4d20", 1400),
  entrepreneur: u("1556742049-0cfed4f6a45d"),
  farming: u("1500937386664-56d1dfef3854"),
  solarFarm: u("1509391366360-2e959784a276"),
  team: u("1521737711867-e3b97375f902"),
  phoneUser: u("1573497019940-1c28c88b4f3e"),
  handshake: u("1521791136064-7986c2920216"),
  shopOwner: u("1560250097-0b93528c311a"),
  family: u("1511632765486-a01980e01a18"),
  meeting: u("1556742393-d75f468bfcb0"),
  market: u("1543269865-cbf427effbad"),
  mobileMoney: u("1590650153855-d9e808231d41"),
  invest: u("1516321318423-f06f85e504b3"),
  officeTalk: u("1521737604893-d14cc237f11d"),
};
