export type MananomayInput = {
    name: string;
    kahon: number;
    harvestTaro: number;
};

export type MananomayResult = {
    name: string;
    kahon: number;
    harvestTaro: number;
    harvesterShare: number;
    fixedKahonShare: number;
    harvestShare: number;
    ownerShare: number;
    tenantShare: number;
};

const roundFarmShare = (value: number): number => {
    const whole = Math.floor(value);
    const decimal = value - whole;

    if (decimal <= 0.34) {
        return whole;
    }

    if (decimal <= 0.69) {
        return whole + 0.5;
    }

    return whole + 1;
};

// console.log("3.34 =", roundFarmShare(3.34));
// console.log("3.35 =", roundFarmShare(3.35));
// console.log("3.69 =", roundFarmShare(3.69));
// console.log("3.70 =", roundFarmShare(3.70));

// console.log("10.34 =", roundFarmShare(10.34));
// console.log("10.35 =", roundFarmShare(10.35));
// console.log("10.69 =", roundFarmShare(10.69));
// console.log("10.70 =", roundFarmShare(10.70));

export const calculateIndividualShare = (
    person: MananomayInput
): MananomayResult => {
    // 1. Harvester gets 1 taro for every 15 taro
    const harvesterShare = roundFarmShare(
        person.harvestTaro / 15
    );

    // 2. Mananomay gets 2 taro per kahon
    const fixedKahonShare = person.kahon * 2;

    // 3. Remaining harvest after harvester + fixed kahon share
    const afterFixedShares =
        person.harvestTaro -
        harvesterShare -
        fixedKahonShare;

    // 4. Mananomay gets 1 taro for every 5 taro
    const harvestShare = roundFarmShare(
        afterFixedShares / 5
    );

    // 5. Remaining after mananomay's shares
    const afterMananomay =
        afterFixedShares - harvestShare;

    // 6. Owner gets 1 taro for every 4 taro
    const ownerShare = roundFarmShare(
        afterMananomay / 4
    );

    // 7. Tenant gets whatever remains
    const tenantShare =
        person.harvestTaro -
        harvesterShare -
        fixedKahonShare -
        harvestShare -
        ownerShare;

    return {
        name: person.name,
        kahon: person.kahon,
        harvestTaro: person.harvestTaro,
        harvesterShare,
        fixedKahonShare,
        harvestShare,
        ownerShare,
        tenantShare,
    };
};

export const calculateIndividualShares = (
    people: MananomayInput[]
): MananomayResult[] => {
    return people.map((person) =>
        calculateIndividualShare(person)
    );
};

export const formatTaro = (taro: number): string => {
    const sacks = Math.floor(taro / 4);
    const remainingTaro = taro % 4;

    if (remainingTaro === 0) {
        return `${sacks} sack${sacks !== 1 ? 's' : ''}`;
    }

    if (sacks === 0) {
        return `${remainingTaro} taro`;
    }

    return `${sacks} sack${sacks !== 1 ? 's' : ''} + ${remainingTaro} taro`;
};