export default {
  title: 'Golf Scores',
  name: 'golfScores',
  type: 'document',
  fields: [
    {
      title: 'Course',
      name: 'course',
      type: 'string',
    },
    {
      title: 'Date',
      name: 'date',
      type: 'date',
      options: {},
    },
    {
      title: 'Score',
      name: 'score',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'score',
      subtitle: 'course',
      date: 'date',
    },
  },
  orderings: [
    {
      title: 'Post Date - First',
      name: 'scoresOrderAsc',
      by: [{field: 'date', direction: 'asc'}],
    },
    {
      title: 'Post Date - Last',
      name: 'scoresOrderDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
}
