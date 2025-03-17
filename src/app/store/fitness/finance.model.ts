export enum AssetClassValue {
  GovBonds = 'bondsValue',
  UsEquities = 'usEquitiesValue',
  InternationalEquities = 'internationalEquitiesValue',
  EmergingMarketEquities = 'emergingMarketEquitiesValue',
  GlobalEquities = 'globalEquitiesValue',
  Gold = 'goldValue',
  Cryptocurrencies = 'cryptoValue',
}

export enum AssetClass {
  GovBonds = 'govBonds',
  UsEquities = 'usEquities',
  InternationalEquities = 'internationalEquities',
  EmergingMarketEquities = 'emergingMarketEquities',
  GlobalEquities = 'globalEquities',
  Gold = 'gold',
  Cryptocurrencies = 'cryptocurrencies',
}

export const AssetClassLabels: Record<AssetClass, string> = {
  [AssetClass.GovBonds]: 'Government Bonds',
  [AssetClass.UsEquities]: 'U.S. Equities',
  [AssetClass.InternationalEquities]: 'International Equities',
  [AssetClass.EmergingMarketEquities]: 'Emerging Market Equities',
  [AssetClass.GlobalEquities]: 'Global Equities',
  [AssetClass.Gold]: 'Gold',
  [AssetClass.Cryptocurrencies]: 'Cryptocurrencies',
};
