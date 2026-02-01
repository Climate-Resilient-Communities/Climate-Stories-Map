import React from 'react';
import {
  Drop,
  Fire,
  FirstAidKit,
  ForkKnife,
  House,
  Leaf,
  Megaphone,
  Sparkle,
  UsersThree,
  Wind,
} from 'phosphor-react';

import type { TopicTagType } from '../../utils/tag-constants';

type Props = {
  topicTag?: TopicTagType;
  size?: number;
};

const TopicMarkerIcon: React.FC<Props> = ({ topicTag, size = 14 }) => {
  // Keep icon stroke consistent regardless of the marker fill color.
  const common = { size, weight: 'bold' as const };

  switch (topicTag) {
    case 'Extreme heat':
      return <Fire {...common} />;
    case 'Flooding':
      return <Drop {...common} />;
    case 'Wildfire':
      return <Fire {...common} />;
    case 'Air quality':
      return <Wind {...common} />;
    case 'Food & water':
      return <ForkKnife {...common} />;
    case 'Housing':
      return <House {...common} />;
    case 'Renewable energy':
      return <Leaf {...common} />;
    case 'Health':
      return <FirstAidKit {...common} />;
    case 'Equity':
      return <UsersThree {...common} />;
    case 'Climate action':
      return <Megaphone {...common} />;
    default:
      return <Sparkle {...common} />;
  }
};

export default TopicMarkerIcon;
