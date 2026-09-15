export const eligibilityStatusLabel = (status: any) => ({
  INCOMPLETE: 'Incomplete',
  RESEARCH_REQUIRED: 'Research needed',
  NOT_ALIGNED: 'Not eligible based on reported criteria',
  OVERRIDDEN: 'Overridden eligibility',
  ALIGNED: 'Aligned'
}[String(status || '')] || 'Not started');

export const programStatusLabel = (status: any) => ({
  ADDED: 'Not started',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  RESEARCH_NEEDED: 'Research needed',
  ELIGIBILITY_MISMATCH: 'Eligibility mismatch',
  OVERRIDE_REQUIRED: 'Override required',
  ASSESSED: 'Assessed'
}[String(status || '')] || 'Not started');

export const recommendationLabel = (code: any) => ({
  STRONG: 'Strong signal candidate',
  REASONABLE: 'Reasonable signal candidate',
  PORTFOLIO_REACH: 'Portfolio reach',
  POOR_USE: 'Poor use of a signal',
  APPLY_WITHOUT_SIGNAL: 'Apply without signal',
  DO_NOT_SIGNAL: 'Do not signal',
  COMPLETE_RESEARCH: 'Research needed before scoring',
  COMPLETE_ASSESSMENT: 'Complete assessment'
}[String(code || '')] || String(code || '').replaceAll('_', ' ').toLowerCase().replace(/^./, x => x.toUpperCase()));

export const statusClass = (status: any) => {
  const s = String(status || '');
  if (s === 'ASSESSED' || s === 'ALIGNED') return 'success';
  if (s === 'RESEARCH_NEEDED' || s === 'RESEARCH_REQUIRED' || s === 'IN_PROGRESS') return 'warning';
  if (s === 'ELIGIBILITY_MISMATCH' || s === 'NOT_ALIGNED' || s === 'OVERRIDE_REQUIRED') return 'danger';
  return 'neutral';
};
