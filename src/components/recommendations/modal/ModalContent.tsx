import React from 'react';
import { HorizontalTab } from './HorizontalTabs';
import { VerticalTab } from './VerticalTabs';

interface ModalContentProps {
  horizontalTab: HorizontalTab;
  verticalTab: VerticalTab;
}

const ModalContent = ({ horizontalTab, verticalTab }: ModalContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="p-6">
        <ol className="list-decimal space-y-4 pl-4">
          <li>Die Entscheidung des Plenums gemäß § 16 Abs. 3 BVerfGG begründet die Zuständigkeit des Senats endgültig; der Senat kann die Sache nicht mehr an den anderen Senat verweisen; das Plenum kann seinen Beschluß nicht mehr ändern.</li>
          <li>Mitglieder einer Regierung sind "Beamte" im Sinne des § 22 Abs. 1 Satz 3 BVerfGG.</li>
          <li>Das Bundesverfassungsgericht hat nur die Rechtmäßigkeit einer Norm, nicht auch ihre Zweckmäßigkeit nachzuprüfen. Die Frage, ob das Grundgesetz dem Gesetzgeber Ermessensfreiheit einräumt, und wie weit sie reicht, ist eine vom Bundesverfassungsgericht nachzuprüfende Rechtsfrage.</li>
          {Array.from({ length: 10 }).map((_, i) => (
            <li key={i + 4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ModalContent;