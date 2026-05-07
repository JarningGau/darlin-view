import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import App from '../../App';

test('uploads TSV rows, filters them, and shows alignment detail for the selected row', async () => {
  const user = userEvent.setup();
  render(<App />);

  const file = new File(
    ['aligned_query\taligned_ref\nAC-G\tACCG\nACTG\tACTG\n'],
    'alignments.tsv',
    { type: 'text/tab-separated-values' }
  );

  await user.upload(screen.getByLabelText('Upload TSV'), file);

  expect(await screen.findByText(/Total rows:\s*2/)).toBeInTheDocument();

  const rowButton = screen.getByRole('button', { name: /Row 1/ });
  await user.click(rowButton);

  expect(await screen.findByText('Alignment Detail')).toBeInTheDocument();
  expect(await screen.findByText(/Deletion columns:\s*1/)).toBeInTheDocument();

  await user.type(screen.getByLabelText('Search'), 'ACTG');

  const list = screen.getByRole('list', { name: 'Alignment rows' });
  expect(within(list).getAllByRole('button')).toHaveLength(1);
});

test('shows a row-level validation error for malformed uploads', async () => {
  const user = userEvent.setup();
  render(<App />);

  const file = new File(['aligned_query\taligned_ref\nACGT\tACG\n'], 'bad.tsv', {
    type: 'text/tab-separated-values'
  });

  await user.upload(screen.getByLabelText('Upload TSV'), file);

  expect(
    await screen.findByText('Row 1: aligned_query and aligned_ref must have equal length')
  ).toBeInTheDocument();
  expect(screen.getByText('No rows loaded yet.')).toBeInTheDocument();
});
