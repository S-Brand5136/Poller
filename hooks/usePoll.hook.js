import useStore from "../store/app-state-store.hook";
import {compareDates} from "../lib/compareDates";
import {useAxios} from "./use-axios.hook";
import {useMemo} from 'react';

export const usePoll = (options, settings, pollId) => {
  const {error, fetchData, loading} = useAxios()
  const totalVotes = useMemo(
    () => options.reduce((acc, curr) => acc + curr.votes, 0),
    [options]
  );
  const {hasPollEnded, hasPollStarted} = useMemo(() => {
    const hasPollEnded = compareDates(settings.endDate);
    const hasPollStarted = compareDates(settings.startDate);

    return {
      hasPollEnded,
      hasPollStarted
    }
  }, [settings])

  const castVote = async (id) => {
    try {
      const res = await fetchData({
        method: 'PUT',
        url: `/api/question/${id}`
      });

      const updateOptions = options.map((item) => {
        if (Number(item.id) === Number(res.updatedQuestion.id)) {
          return res.updatedQuestion;
        }

        return item;
      });

      const pollsVotedOn = JSON.parse(localStorage.getItem("pollsVotedOn"));

      if (!pollsVotedOn) {
        localStorage.setItem("pollsVotedOn", JSON.stringify([pollId]));
      } else {
        pollsVotedOn.push(pollId);
        localStorage.setItem("pollsVotedOn", JSON.stringify(pollsVotedOn));
      }

      useStore.setState({options: [...updateOptions]});
    } catch (err) {

    }

  };


  return {castVote, loading, error, hasPollEnded, hasPollStarted, totalVotes}
}