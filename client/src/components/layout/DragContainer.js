import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const DragContainer = ({ listType, action, actionArguments, children }) => {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (destination.index === source.index) {
      return;
    }
    const position = destination.index + 1;
    const args = actionArguments || {};
    action({ position, ...args }, draggableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={listType}>
        {(provided) => {
          return (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {children}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};

export default DragContainer;
