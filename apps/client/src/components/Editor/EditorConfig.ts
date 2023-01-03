import theme from './EditorTheme';
import { EquationNode } from './plugins/Equation/Equation';


export const EditorConfig = {
  namespace: 'Editor',
  theme,
  nodes: [EquationNode],
  onError(error: any) {
    throw error;
  },
};
