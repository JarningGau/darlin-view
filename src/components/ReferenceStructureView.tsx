import { deriveReferenceBlocks } from '../lib/referenceLayout';
import type { ReferenceDefinition } from '../types';

interface ReferenceStructureViewProps {
  reference: ReferenceDefinition;
}

export default function ReferenceStructureView({ reference }: ReferenceStructureViewProps) {
  const blocks = deriveReferenceBlocks(reference);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Reference Structure</h2>
        <p>{reference.displayName}</p>
      </div>
      <div className="structure-strip" role="list" aria-label="Reference structure blocks">
        {blocks.map((block) => (
          <button
            key={`${block.type}-${block.start}`}
            type="button"
            className={`structure-block structure-block--${block.type}`}
            title={`${block.label}: ${block.start}-${block.end - 1}`}
          >
            <span>{block.label}</span>
            <small>
              {block.start}-{block.end - 1}
            </small>
          </button>
        ))}
      </div>
      <div className="structure-legend">
        <span>Prefix</span>
        <span>Segment</span>
        <span>PAM</span>
        <span>Postfix</span>
      </div>
      <pre className="reference-sequence">{reference.referenceSequence}</pre>
    </section>
  );
}
