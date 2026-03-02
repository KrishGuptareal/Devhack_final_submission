function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div>
        <h4 className="task-title">{task.subject}</h4>
        <p className="task-sub">
          {task.time} • {task.exam}
        </p>
      </div>

      <button className="focus-btn">▶ Start Focus Mode</button>
    </div>
  );
}

export default TaskCard;
