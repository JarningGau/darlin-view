import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import App from '../../App';

test('uploads TSV rows and renders structure, cutsite emphasis, and wrapped alignment detail', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(
        ['aligned_query\taligned_ref\nAC-G\tACCG\nACTG\tACTG\n'],
        'alignments.tsv',
        { type: 'text/tab-separated-values' }
    );

    await user.upload(screen.getByLabelText('Upload TSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText(/Total rows:\s*2/)).toBeInTheDocument();

    const rowButton = screen.getByRole('button', { name: /Row 1/ });
    await user.click(rowButton);

    expect(await screen.findByText('Alignment Detail')).toBeInTheDocument();
    expect(screen.queryByText('Reference Structure')).not.toBeInTheDocument();
    expect(await screen.findByText(/Deletion columns:\s*1/)).toBeInTheDocument();
    expect(screen.getByText('Mutation annotation')).toBeInTheDocument();
    expect(screen.getByText('3_3del')).toBeInTheDocument();
    expect(screen.getByText('Reference overview')).toBeInTheDocument();
    expect(screen.getAllByText(/Cutsite/i).length).toBeGreaterThan(0);

    const wrappedSegments = screen.getAllByTestId(/alignment-segment-/);
    expect(wrappedSegments).toHaveLength(1);

    await user.type(screen.getByLabelText('Search'), 'ACTG');

    const list = screen.getByRole('list', { name: 'Alignment rows' });
    expect(within(list).getAllByRole('button')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText(/Total rows:\s*0/)).toBeInTheDocument();
    expect(screen.getByText('No rows loaded yet.')).toBeInTheDocument();
});

test('loads TSV rows submitted from pasted text', async () => {
    const user = userEvent.setup();
    render(<App />);

    fireEvent.change(screen.getByLabelText('Paste TSV'), {
        target: {
            value: 'aligned_query\taligned_ref\nAC-G\tACCG\nACTG\tACTG\n'
        }
    });
    await user.click(screen.getByRole('button', { name: 'Submit TSV' }));

    expect(await screen.findByText(/Total rows:\s*2/)).toBeInTheDocument();
    expect(await screen.findByText('Alignment Detail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 1/ })).toBeInTheDocument();
});

test('wraps alignment detail into multiple segments when the available width shrinks', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(
        ['aligned_query\taligned_ref\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n'],
        'long.tsv',
        { type: 'text/tab-separated-values' }
    );

    await user.upload(screen.getByLabelText('Upload TSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload' }));
    await user.click(await screen.findByRole('button', { name: /Row 1/ }));

    const firstTrackBases = screen
        .getByTestId('alignment-segment-0')
        .querySelector('.alignment-track')
        ?.querySelectorAll('.base');
    expect(firstTrackBases?.[17]).toHaveClass('base--consite-region');
    expect(firstTrackBases?.[17]).not.toHaveClass('base--cutsite-region');
    expect(firstTrackBases?.[18]).toHaveClass('base--cutsite-region');
    expect(firstTrackBases?.[25]).toHaveClass('base--pam-region');

    const initialSegmentCount = screen.getAllByTestId(/alignment-segment-/).length;
    expect(initialSegmentCount).toBeGreaterThanOrEqual(1);

    await act(async () => {
        window.dispatchEvent(new CustomEvent('test:set-detail-width', { detail: 240 }));
    });

    const shrunkSegments = await screen.findAllByTestId(/alignment-segment-/);
    expect(shrunkSegments.length).toBeGreaterThan(initialSegmentCount);
});

test('renders multi-digit positions as horizontal labels in alignment detail', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(
        ['aligned_query\taligned_ref\nAAAAAAAAAAAA\tAAAAAAAAAAAA\n'],
        'positions.tsv',
        { type: 'text/tab-separated-values' }
    );

    await user.upload(screen.getByLabelText('Upload TSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload' }));
    await user.click(await screen.findByRole('button', { name: /Row 1/ }));

    const firstSegment = screen.getByTestId('alignment-segment-0');
    const positionLabel = within(firstSegment).getByTestId('ruler-cell-0-10');

    expect(positionLabel).toHaveTextContent('11');
    expect(positionLabel.childElementCount).toBe(0);
});

test('shows a row-level validation error for malformed uploads', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['aligned_query\taligned_ref\nACGT\tACG\n'], 'bad.tsv', {
        type: 'text/tab-separated-values'
    });

    await user.upload(screen.getByLabelText('Upload TSV'), file);
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(
        await screen.findByText('Row 1: aligned_query and aligned_ref must have equal length')
    ).toBeInTheDocument();
    expect(screen.getByText('No rows loaded yet.')).toBeInTheDocument();
});
