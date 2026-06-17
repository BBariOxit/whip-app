/**
 * Mock data cho Sandbox Board trên trang Login/Register.
 * 100% client-side – không liên quan gì tới Backend hay MongoDB.
 */

export const SANDBOX_BOARD = {
  _id: 'sandbox-board-001',
  title: 'My Project Board',
  columnOrderIds: ['sandbox-col-01', 'sandbox-col-02'],
  columns: [
    {
      _id: 'sandbox-col-01',
      boardId: 'sandbox-board-001',
      title: '📋 To Do',
      cardOrderIds: [
        'sandbox-card-01',
        'sandbox-card-02',
        'sandbox-card-03',
        'sandbox-card-04'
      ],
      cards: [
        {
          _id: 'sandbox-card-01',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Design new landing page',
          cover: null,
          memberIds: ['user-01', 'user-02'],
          totalComments: 3,
          attachments: [],
          labelColors: ['#2ecc71', '#3498db'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-02',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Setup CI/CD pipeline',
          cover: null,
          memberIds: ['user-01'],
          totalComments: 1,
          attachments: [{ _id: 'att-1' }],
          labelColors: ['#e74c3c'],
          dueDate: null,
          dueComplete: false,
          checklists: [
            {
              _id: 'cl-1',
              items: [
                { _id: 'cl-1-i-1', isCompleted: true },
                { _id: 'cl-1-i-2', isCompleted: false },
                { _id: 'cl-1-i-3', isCompleted: false }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-03',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Write API documentation',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: ['#f39c12'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-04',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Research payment gateway integration',
          cover: null,
          memberIds: ['user-02', 'user-03'],
          totalComments: 5,
          attachments: [{ _id: 'att-2' }, { _id: 'att-3' }],
          labelColors: ['#9b59b6', '#3498db'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        }
      ]
    },
    {
      _id: 'sandbox-col-02',
      boardId: 'sandbox-board-001',
      title: '🚀 In Progress',
      cardOrderIds: [
        'sandbox-card-05',
        'sandbox-card-06',
        'sandbox-card-07'
      ],
      cards: [
        {
          _id: 'sandbox-card-05',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Build user authentication flow',
          cover: null,
          memberIds: ['user-01'],
          totalComments: 2,
          attachments: [],
          labelColors: ['#e74c3c', '#f39c12'],
          dueDate: null,
          dueComplete: false,
          checklists: [
            {
              _id: 'cl-2',
              items: [
                { _id: 'cl-2-i-1', isCompleted: true },
                { _id: 'cl-2-i-2', isCompleted: true },
                { _id: 'cl-2-i-3', isCompleted: false },
                { _id: 'cl-2-i-4', isCompleted: false }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-06',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Implement drag & drop board',
          cover: null,
          memberIds: ['user-01', 'user-02', 'user-03'],
          totalComments: 8,
          attachments: [{ _id: 'att-4' }],
          labelColors: ['#2ecc71'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-07',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Optimize database queries',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: ['#f39c12', '#9b59b6'],
          dueDate: null,
          dueComplete: false,
          checklists: [
            {
              _id: 'cl-3',
              items: [
                { _id: 'cl-3-i-1', isCompleted: true },
                { _id: 'cl-3-i-2', isCompleted: true },
                { _id: 'cl-3-i-3', isCompleted: true }
              ]
            }
          ],
          customFieldValues: []
        }
      ]
    }
  ]
}
